import { ILSPluginUser, BlockEntity } from '@logseq/libs/dist/LSPlugin';
import { debug, getCurrentPage, getSettings, scrollToBlockInPage } from '../common/funcs';

export default (logseq: ILSPluginUser) => {
  const settings = getSettings();

  logseq.App.registerCommandPalette({
    key: 'vim-shortcut-search',
    label: 'Search',
    keybinding: {
      mode: 'non-editing',
      binding: settings.search,
    }
  }, async () => {
    debug('Search');

    // @ts-ignore
    await logseq.App.invokeExternalCommand('logseq.go/search-in-page');
  });
};
