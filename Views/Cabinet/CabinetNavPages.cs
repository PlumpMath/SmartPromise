using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc.Rendering;
using Microsoft.AspNetCore.Mvc.ViewFeatures;

namespace Promises.Views.Cabinet
{
    public static class CabinetNavPages
    {
        public const string ActivePageKey = "ActivePage";

        public const string PrivateChat = "PrivateChat";

        public const string Messages = "Messages";

        public const string Profile = "Profile";

        public const string ManagePromises = "ManagePromises";

        public const string GlobalChat = "GlobalChat";

        public const string Friends = "Friends";
        public static string MessagesClass(ViewContext viewContext) => PageNavClass(viewContext, Messages);

        public static string IndexNavClass(ViewContext viewContext) => PageNavClass(viewContext, Profile);

        public static string PrivateChatNavClass(ViewContext viewContext) => PageNavClass(viewContext, GlobalChat);

        public static string ManagePromisesNavClass(ViewContext viewContext) => PageNavClass(viewContext, ManagePromises);

        public static string GlobalChatClass(ViewContext viewContext) => PageNavClass(viewContext, GlobalChat);
        public static string FriendsClass(ViewContext viewContext) => PageNavClass(viewContext, Friends);

        public static bool IsActivePage(ViewDataDictionary viewData, string page) =>
            viewData["ActivePage"] as string == page;
        
        public static string PageNavClass(ViewContext viewContext, string page)
        {
            var activePage = viewContext.ViewData["ActivePage"] as string;
            return string.Equals(activePage, page, StringComparison.OrdinalIgnoreCase) ? "active" : null;
        }

        public static void AddActivePage(this ViewDataDictionary viewData, string activePage) => viewData[ActivePageKey] = activePage;
    }
}
