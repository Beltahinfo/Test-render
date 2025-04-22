const { keith } = require('../keizzah/keith');
const { updateAntiCallSettings, getAntiCallSettings } = require('../database/anticall');
keith({
    nomCom: 'anticall',
    categorie: 'Mods',
    reaction: '📵'
}, async (dest, zk, commandeOptions) => {
    const { arg, repondre, prefixe, superUser } = commandeOptions;

    if (!superUser) return repondre('❌ Owner privileges required');

    const action = arg[0]?.toLowerCase();
    const subAction = arg[1]?.toLowerCase();

    if (!action) {
        const settings = await getAntiCallSettings();
        return repondre(
            `📵 *Anti-Call Settings*\n\n` +
            `Status: ${settings.status === 'yes' ? '✅ ON' : '❌ OFF'}\n` +
            `Action: ${settings.action}\n\n` +
            `Usage:\n` +
            `${prefixe}anticall on - Enable protection\n` +
            `${prefixe}anticall off - Disable protection\n` +
            `${prefixe}anticall block - Block callers\n` +
            `${prefixe}anticall decline - Just decline calls`
        );
    }

    try {
        let response = '';
        
        switch (action) {
            case 'on':
                await updateAntiCallSettings({ status: 'yes' });
                response = '✅ Anti-call protection ENABLED';
                break;
                
            case 'off':
                await updateAntiCallSettings({ status: 'no' });
                response = '✅ Anti-call protection DISABLED';
                break;
                
            case 'block':
                await updateAntiCallSettings({ action: 'block', status: 'yes' });
                response = '✅ Anti-call set to BLOCK callers';
                break;
                
            case 'decline':
                await updateAntiCallSettings({ action: 'decline', status: 'yes' });
                response = '✅ Anti-call set to DECLINE calls';
                break;
                
            default:
                return repondre(`❌ Invalid option. Use ${prefixe}anticall on/off/block/decline`);
        }

        return repondre(response);
    } catch (error) {
        console.error('Anti-call command error:', error);
        return repondre('❌ Failed to update settings');
    }
});
