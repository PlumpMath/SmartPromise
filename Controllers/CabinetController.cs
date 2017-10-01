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
using Microsoft.EntityFrameworkCore;

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

        [HttpPost]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> CreatePromise(PromiseCreationModel promise)
        {
            try
            {
                if (ModelState.IsValid)
                {
                    var user = await _userManager.GetUserAsync(HttpContext.User);
                    var userId = user.Id;
                    _promiseRepository.Add(new Promise { Content = promise.Content, UserId = userId });
                    return RedirectToAction(nameof(Index));
                }
            }
            catch (DbUpdateException /* ex */)
            {
                //Log the error (uncomment ex variable name and write a log.
                ModelState.AddModelError("", "Unable to save changes. " +
                    "Try again, and if the problem persists " +
                    "see your system administrator.");
            }
            return View(promise);
        }

        public IActionResult CreatePromise()
        {
            return View();
        }

        public async Task<IActionResult> ManagePromises()
        {
            var user = await _userManager.GetUserAsync(HttpContext.User);
            var userId = user.Id;
            var promises = _promiseRepository.Promises.Where(p => p.UserId == userId);
            
            //var promises = new List<Promise> { new Promise { Content = "Climb on elbrus" }, new Promise { Content = "Get a million" } };
            var model = new ManagePromisesViewModel{ Promises = promises };
            return View(model);
        }
    }
}
