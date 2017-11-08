
var HELPERS = (function () {
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
    }
    
})()