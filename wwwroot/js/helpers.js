
var HELPERS = (function () {
    const NET = {
        "testnet": 0,
        "mainnet": 1
    }

    const ASSETS = {
        "neo": 0,
        "gas": 1
    }

    function Loader(loader_id) {
        return (loader_id => {
            const LOADER_STYLE = "loader"
            const LOADER_ID = loader_id

            return {
                Show: () => {
                    if (!$(LOADER_ID).hasClass(LOADER_STYLE)) {
                        $(LOADER_ID).addClass(LOADER_STYLE)
                    }
                },
                Hide: () => {
                    if ($(LOADER_ID).hasClass(LOADER_STYLE)) {
                        $(LOADER_ID).removeClass(LOADER_STYLE)
                    }
                }
            }
        })(loader_id)
    }

    console.log("______________helpers.js______________")
    return {
        GetAvatarImageUrl: (width, height, quality, userId) =>
            _RAZOR_URL_CABINET_GET_AVATAR
                .replace("__width__", width.toString())
                .replace("__height__", height.toString())
                .replace("__quality__", quality.toString())
                .replace("__id__", userId.toString())
        ,

        GetUserProfileHref: userId =>
            _RAZOR_PROFILE_LINK.replace("__id__", userId)
        ,
        GetBlockchainBalanceUrl: (net, addr) =>
            _RAZOR_BLOCKCHAIN_GET_BALANCE
                .replace("__network__", NET[net])
                .replace("__addr__", addr)

        ,
        GetSendAssetUrl: (asset, addr, net, amount) => 
            _RAZOR_SEND_ASSET
                .replace("__assetName__", ASSETS[asset])
                .replace("__network__", NET[net])
                .replace("__addr__", addr)
                .replace("__amount__", amount)
        ,

        Loader
        ,
        NET
        ,
        ASSETS
    
    }
    
})()