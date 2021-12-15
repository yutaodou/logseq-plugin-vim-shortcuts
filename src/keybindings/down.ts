import { ILSPluginUser, BlockEntity } from '@logseq/libs/dist/LSPlugin';
import { debug, getCurrentBlockUUID, getCurrentPage, getSettings, scrollToBlockInPage, setLastBlockUUID } from '../common/funcs';

export default (logseq: ILSPluginUser) => {
  const settings = getSettings();

  logseq.App.registerCommandPalette({
    key: 'vim-shortcut-down',
    label: 'down',
    keybinding: {
      mode: 'non-editing',
      binding: settings.down
    }
  }, async () => {
    debug('Down');

    // @ts-ignore
    await logseq.App.invokeExternalCommand('logseq.editor/down');
    await logseq.Editor.exitEditingMode(true);
    const uuid = await getCurrentBlockUUID();
    if (uuid) {
      setLastBlockUUID(uuid);
    }
  });
};
