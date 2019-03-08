browser.browserAction.onClicked.addListener(focus);

var windows;
var tabs;

async function focus(currentTab) {
  windows = await browser.windows.getAll();
  tabs = await browser.tabs.query({});
  var tabsWithoutTheCurrentOne = tabs.filter(item => item.id != currentTab.id);

  console.log('Saved', windows.length, 'window(s) and', tabs.length, 'tab(s).')

  tabsWithoutTheCurrentOne.map(tab => {
    if (tab.pinned)
      return;
    return browser.tabs.remove(tab.id);
  });

  browser.tabs.onRemoved.addListener(async (tabId) => {
    if (currentTab.id != tabId)
      return;

    await openClosedTabs(tabsWithoutTheCurrentOne);
  });
}

async function openClosedTabs(tabs) {
  tabs.map(async tab => {
    if (tab.url.startsWith('about:'))
      return;

    console.log('Reopening', tab.url);
    await browser.tabs.create({ url : tab.url });
  });
}
