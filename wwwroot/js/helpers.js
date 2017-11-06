console.log("______________helpers.js______________")
var HELPERS = (function () {
    return {
        GetAvatarImageUrl: (width, height, quality, userId) =>
            _RAZOR_URL_CABINET_GET_AVATAR
                .replace("__width__", width.toString())
                .replace("__height__", height.toString())
                .replace("__quality__", quality.toString())
                .replace("__id__", userId.toString())
    }
}
)()