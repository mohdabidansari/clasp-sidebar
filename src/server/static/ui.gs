/**
 * @OnlyCurrentDoc
 *
 * The above comment directs Apps Script to limit the scope of file
 * access for this add-on. It specifies that this add-on will only
 * attempt to read or modify the files in which the add-on is used,
 * and not all of the user's files. The authorization request message
 * presented to users will reflect this limited scope.
 */

/**
 * Creates a menu entry in the Google Docs UI when the document is opened.
 * This method is only used by the regular add-on, and is never called by
 * the mobile add-on version.
 *
 * @param {object} e The event parameter for a simple onOpen trigger. To
 *     determine which authorization mode (ScriptApp.AuthMode) the trigger is
 *     running in, inspect e.authMode.
 */
function onOpen(e) {
  if (e.source) {
    const sourceString = e.source.toString();
    switch (sourceString) {
      case 'Spreadsheet':
        return onOpenSpreadsheet(e);
      case 'Presentation':
        return onOpenSlides(e);
      case 'Document':
        return onOpenDocument(e);
      default:
        throw new Error('Could not load Menu for ', sourceString, ' context');
    }
  } else {
    try {
      return onOpenSpreadsheet(e);
    } catch (error) {
      try {
        return onOpenSlides(e);
      } catch (error) {
        return onOpenDocument(e);
      }
    }
  }
}
/**
 * Runs when the add-on is installed.
 * This method is only used by the regular add-on, and is never called by
 * the mobile add-on version.
 *
 * @param {object} e The event parameter for a simple onInstall trigger. To
 *     determine which authorization mode (ScriptApp.AuthMode) the trigger is
 *     running in, inspect e.authMode. (In practice, onInstall triggers always
 *     run in AuthMode.FULL, but onOpen triggers may be AuthMode.LIMITED or
 *     AuthMode.NONE.)
 */
function onInstall(e) {
  onOpen(e);
}

function onOpenSpreadsheet(e) {
  SpreadsheetApp.getUi()
    .createAddonMenu()
    .addItem('Open', 'showSidebar')
    .addToUi();
}

function onOpenDocument(e) {
  DocumentApp.getUi()
    .createAddonMenu()
    .addItem('Open', 'showDocSidebar')
    .addToUi();
}

function onOpenSlides(e) {
  SlidesApp.getUi()
    .createAddonMenu()
    .addItem('Open', 'showSlidesSidebar')
    .addToUi();
}

const showSidebar = () => {
  const template = HtmlService.createTemplateFromFile('sidebar-main');
  const ui = template.evaluate().setTitle('Sidebar');
  SpreadsheetApp.getUi().showSidebar(ui);
};

const showDocSidebar = () => {
  const template = HtmlService.createTemplateFromFile('sidebar-main');
  const ui = template.evaluate().setTitle('Sidebar');
  DocumentApp.getUi().showSidebar(ui);
};

const showSlidesSidebar = () => {
  const template = HtmlService.createTemplateFromFile('sidebar-main');
  const ui = template.evaluate().setTitle('Sidebar');
  SlidesApp.getUi().showSidebar(ui);
};

const getTokenFromProps = () => {
  const token =
    PropertiesService.getUserProperties().getProperty('sidebar_token');
  return token;
};

const getTokenFromApi = (username, password) => {
  try {
    const payload = {
      username,
      password,
    };
    const options = {
      method: 'post',
      contentType: 'application/json',
      payload: JSON.stringify(payload),
    };
    const response = UrlFetchApp.fetch(
      `${configObj.API_BASE_URL}/signup`,
      options
    );
    const data = JSON.parse(response.getContentText() || '{}');
    console.log(data);
    if (data?.token) {
      PropertiesService.getUserProperties().setProperty(
        'sidebar_token',
        data.token
      );
    }
    return data.token;
  } catch (e) {
    console.log('Error while getting token from api', e.message);
    return '';
  }
};

const removeToken = () => {
  PropertiesService.getUserProperties().deleteProperty('sidebar_token');
};

const getResponseText = (text) => {
  const token = getTokenFromProps();
  if (!token) {
    throw new Error('API key was not set. Please logout and set your API key');
  }
  try {
    const headers = {
      Authorization: `Bearer ${token}`,
    };
    const payload = {
      text,
    };
    const options = {
      method: 'post',
      contentType: 'application/json',
      payload: JSON.stringify(payload),
      headers,
    };
    const response = UrlFetchApp.fetch(`${configObj.API_BASE_URL}/`, options);
    const data = JSON.parse(response.getContentText() || '{}');
    console.log(data);
    if (data.response) return data.response;
    return 'No response from API';
  } catch (e) {
    console.log('Error while getting response text ', e.message);
    throw new Error('Error while getting response text ' + e.message);
  }
};

const insertTextInSheet = () => {
  const range = SpreadsheetApp.getActiveSheet().getActiveRange();
  let text = range.getValue();
  const res = getResponseText(text);
  range.setValue(res);
};

const insertTextInDoc = () => {
  const selection = DocumentApp.getActiveDocument().getSelection();
  if (selection) {
    selection.getRangeElements().forEach((e) => {
      const start = e.getStartOffset();
      const end = e.getEndOffsetInclusive();
      const prompt = e.getElement().asText();
      const generatedText = getResponseText(prompt.getText()); // This is your function.
      prompt.deleteText(start, end);
      prompt.insertText(start, generatedText);
    });
  }
};

const insertTextInSlide = () => {
  const selection = SlidesApp.getActivePresentation().getSelection();
  const textRange = selection.getTextRange();
  const generatedText = getResponseText(textRange.asString());
  textRange.setText(generatedText);
};

const getResponseForSelectedText = () => {
  try {
    SpreadsheetApp.getActiveSheet();
    insertTextInSheet();
  } catch (e) {
    console.error(e);
    try {
      DocumentApp.getActiveDocument();
      insertTextInDoc();
    } catch (e) {
      console.error(e);
      try {
        SlidesApp.getActivePresentation();
        insertTextInSlide();
      } catch (e) {
        throw e;
      }
    }
  }
};
