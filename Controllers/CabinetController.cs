using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Promises.Models;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Authorization;
using Promises.Models.CabinetViewModels;
using Promises.Abstract;

namespace Promises.Controllers
{
    [Authorize]
    [Route("[controller]/[action]")]
    public class CabinetController : Controller
    {
        private readonly UserManager<ApplicationUser> _userManager;
        private readonly SignInManager<ApplicationUser> _signInManager;
        private readonly IPromiseRepository _promiseRepository;

        public CabinetController(
          UserManager<ApplicationUser> userManager,
          SignInManager<ApplicationUser> signInManager,
          IPromiseRepository promiseRepository)
          
        {
            _promiseRepository = promiseRepository;
            _promiseRepository.Add(new Promise { Content = "Hello, world" });
            _userManager = userManager;
            _signInManager = signInManager;
        }

        public IActionResult Index()
        {
            return View();
        }

        public async Task<IActionResult> ManagePromises()
        {
            var users = _userManager.Users;
            

            //var user = await _userManager.FindByIdAsync(User.Identity.GGetUserId());
            //var user = await _userManager.FindByIdAsync(User.Identity.AuthenticationType);
            var user = await _userManager.GetUserAsync(HttpContext.User);
            
            var promises = new List<Promise> { new Promise { Content = "Climb on elbrus" }, new Promise { Content = "Get a million" } };
            var model = new ManagePromisesViewModel{ Promises = promises };
            return View(model);
        }
    }
}
