function focus() {
  console.log('Hello');
}

browser.browserAction.onClicked.addListener(focus);
