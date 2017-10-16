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

        public const string Index = "Index";

        public const string ManagePromises = "ManagePromises";

        public const string GlobalChat = "GlobalChat";

        public const string Friends = "Friends";

        public static string IndexNavClass(ViewContext viewContext) => PageNavClass(viewContext, Index);

        public static string ManagePromisesNavClass(ViewContext viewContext) => PageNavClass(viewContext, ManagePromises);

        public static string GlobalChatClass(ViewContext viewContext) => PageNavClass(viewContext, GlobalChat);
        public static string FriendsClass(ViewContext viewContext) => PageNavClass(viewContext, Friends);

        public static string PageNavClass(ViewContext viewContext, string page)
        {
            var activePage = viewContext.ViewData["ActivePage"] as string;
            return string.Equals(activePage, page, StringComparison.OrdinalIgnoreCase) ? "active" : null;
        }

        public static void AddActivePage(this ViewDataDictionary viewData, string activePage) => viewData[ActivePageKey] = activePage;
    }
}
