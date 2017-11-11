using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Hosting;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Promises.Data;
using Promises.Models;
using Promises.Services;
using Promises.Abstract;
using Promises.Concrete;
using Promises.Hubs;
using Microsoft.Extensions.FileProviders;

namespace Promises
{
    public class Startup
    {
        public Startup(IConfiguration configuration, IHostingEnvironment env)
        {
            Configuration = configuration;
            HostingEnvironment = env;
        }

        public IConfiguration Configuration { get; }
        public IHostingEnvironment HostingEnvironment { get; }

        // This method gets called by the runtime. Use this method to add services to the container.
        public void ConfigureServices(IServiceCollection services)
        {
            services.AddDbContext<UserIdentityDbContext>(options =>
                options.UseSqlServer(Configuration.GetConnectionString("UsersDatabase")));

            services.AddDbContext<ApplicationDbContext>(options =>
                options.UseSqlServer(Configuration.GetConnectionString("ApplicationDatabase")));

            //services.AddTransient<IPromiseRepository, EFPromiseRepository>();
            services.AddTransient<IPromiseRepository, BlockchainNeoPromiseRepository>();

            services.AddTransient<IFriendsRepository, EFFriendsRepository>();
            services.AddTransient<IMessagesRepository, EFMessagesRepository>();
            services.AddTransient<IBlockchain, NeoBlockchain>();


            services.AddIdentity<ApplicationUser, IdentityRole>()
                .AddEntityFrameworkStores<UserIdentityDbContext>()
                .AddDefaultTokenProviders();



            // Add application services.
            services.AddTransient<IEmailSender, EmailSender>();

            services.AddSingleton(typeof(DefaultNotificator<,>), typeof(DefaultNotificator<,>));
            services.AddSingleton(typeof(INotificator<Chat, IMessagesRepository>), typeof(NotificatorChatMessages));
            services.AddSingleton(typeof(INotificator<Notification, IMessagesRepository>), typeof(NotificatorNotificationMessages));
            services.AddSingleton(typeof(IUserTracker<>), typeof(InMemoryUserTracker<>));
            
            var physicalProvider = HostingEnvironment.ContentRootFileProvider;
            services.AddSingleton<IFileProvider>(physicalProvider);
            //services.AddScoped<Chat>(p => new Chat(p.GetRequiredService<InMemoryUserTracker<Chat>>()));

            services.AddSignalR();
            services.AddMvc();
            services.AddNodeServices();
        }

        // This method gets called by the runtime. Use this method to configure the HTTP request pipeline.
        public void Configure(IApplicationBuilder app, IHostingEnvironment env)
        {
            if (env.IsDevelopment())
            {
                app.UseDeveloperExceptionPage();
                app.UseDatabaseErrorPage();
            }
            else
            {
                app.UseDeveloperExceptionPage();
                app.UseDatabaseErrorPage();
                //app.UseExceptionHandler("/Home/Error");
            }

            app.UseStaticFiles();

            app.UseAuthentication();
            
            app.UseSignalR(routes =>
            {
                routes.MapHub<Chat>("chat");
                routes.MapHub<Notification>("notification");
            });

            app.UseMvc(routes =>
            {
                routes.MapRoute(
                    name: "default",
                    template: "{controller=Home}/{action=Index}/{id?}");
            });
        }
    }
}
