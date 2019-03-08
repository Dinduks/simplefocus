browser.browserAction.onClicked.addListener(focus);

window.simplefocus = {
  windows: undefined,
  tabs: undefined,
  temporaryPinnedTab: undefined,
};

async function closeTabs(tabs) {
  tabs.map(tab => {
    if (tab.pinned)
      return;

    return browser.tabs.remove(tab.id);
  });
}

async function createTemporaryPinnedTab(tabs) {
  if (tabs.filter(tab => tab.pinned).length > 0)
    return;

  console.log('Creating the temporary pinned tab.')
  window.simplefocus.temporaryPinnedTab = await browser.tabs.create({
    url : 'https://samy.dindane.com',
    pinned: true,
    active: false
  });
}

async function removeTemporaryPinnedTab() {
  console.log('Removing the temporary pinned tab.')
  browser.tabs.remove(window.simplefocus.temporaryPinnedTab.id);
}

async function focus(currentTab) {
  if (currentTab.pinned)
    return;

  window.simplefocus.windows = await browser.windows.getAll();
  window.simplefocus.tabs = await browser.tabs.query({});

  var tabsExceptTheCurrentOne = window.simplefocus.tabs.filter(item => item.id != currentTab.id);

  console.log('Saved', window.simplefocus.windows.length, 'window(s) and', window.simplefocus.tabs.length, 'tab(s).')

  closeTabs(tabsExceptTheCurrentOne);

  createTemporaryPinnedTab(window.simplefocus.tabs);

  browser.tabs.onRemoved.addListener(async (tabId) => {
    if (currentTab.id != tabId)
      return;

    await openClosedTabs(tabsExceptTheCurrentOne);
  });
}

async function openClosedTabs(tabs) {
  tabs.map(async tab => {
    if (tab.url.startsWith('about:'))
      return;

    console.log('Reopening', tab.url);
    await browser.tabs.create({ url : tab.url });
  });

  removeTemporaryPinnedTab();
}
