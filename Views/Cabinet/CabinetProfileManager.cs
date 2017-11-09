using Microsoft.AspNetCore.Mvc.Rendering;
using Microsoft.AspNetCore.Mvc.ViewFeatures;
using Promises.Models.CabinetViewModels;

namespace Promises.Views.Cabinet
{
    public static class CabinetProfileManager
    {
        public static void AddProfileViewModel(this ViewDataDictionary viewData, ProfileViewModel model) => 
            viewData["ProfileViewModel"] = model;

        public static ProfileViewModel GetProfileViewModel(this ViewDataDictionary viewData) =>
            CabinetNavPages.IsActivePage(viewData, CabinetNavPages.Profile) ?
                viewData["ProfileViewModel"] as ProfileViewModel : null;
    }
}
