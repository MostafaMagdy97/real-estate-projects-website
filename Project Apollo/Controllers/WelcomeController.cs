﻿using Newtonsoft.Json;
using Project_Apollo.Models;
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Text.RegularExpressions;
using System.Web;
using System.Web.Mvc;
namespace Project_Apollo.Controllers {

	public class WelcomeController : Controller {
		public DBase db = new DBase();
		// GET: welcome
		public ActionResult Index() {
            if (Session["id"] != null) 
                return RedirectToAction("Index", "Home");
            ViewBag.currentPage = 0;
			return View();
		}

		public ActionResult signOut() {
			Session.Clear();
			return RedirectToAction("Index", "Welcome");
		}

		public Object login(string email, string password) {
			var data = (from d in db.userTable
						where d.Email == email
						select new { d.ID, d.name, d.UserRole, d.Photo, d.Password }).ToArray();

			if (data.Length != 0 && password.Equals(data[0].Password)) // if email & password TRUE
			{
                Session["id"] = data[0].ID;
				User user = db.userTable.Find(Session["id"]);
				Session["userRole"] = (int)user.UserRole;
				var img = ImageConverter.convertPhotoToString(user.Photo);
				Session["userPhoto"] = img;
				Session["userName"] = user.name;
				Session["userPhoneNumber"] = user.Mobile;
				Session["userEmail"] = user.Email;
				Session["userDescription"] = user.Description;

				return JsonConvert.SerializeObject(new {
					Result = new {
						Email = true,
						password = true
					},
					user = new {
						id = data[0].ID,
						name = data[0].name,
						userRole = data[0].UserRole,
						userPhoto = data[0].Photo
					}
				});
			} else if (data.Length != 0 && !password.Equals(data[0].Password)) // Email is true password is wrong
			  {
				return JsonConvert.SerializeObject(new {
					Result = new {
						Email = true,
						password = "Password doesn't match with the email"
					},
					user = new {
						id = "",
						name = "",
						userRole = "",
						userPhoto = ""
					}
				});
			} else if (data.Length == 0)  // email is wrong
			  {
				return JsonConvert.SerializeObject(new {
					Result = new {
						Email = "Email is not registered",
						password = ""
					},
					user = new {
						id = "",
						name = "",
						userRole = "",
						userPhoto = ""
					}
				});
			}
			
			return null;
		}

		public object signUp(string userPicture, string name, string email, string password, string phoneNumber, string Desciption, int userType = 1) {
			var v = (from a in db.userTable
					 where a.Email == email
					 select a.Email);
			if (v.Count() > 0) {
				return JsonConvert.SerializeObject(new {
					result = new {
						email = "Email is alrady registered"
					},
					user = new {
						id = "",
						name = "",
						userRole = "",
						userPhoto = ""
					}
				});
			} else {
				User user = new User();
				user.name = name;
				user.Email = email;
				user.Password = password;
				user.Mobile = phoneNumber;
				user.UserRole = (userRole)userType;
				user.Description = Desciption;
				user.Photo = userPicture !=null ? ImageConverter.convertPhotoToBytes(userPicture):null;
				db.userTable.Add(user);
				db.SaveChanges();
				if (Session["id"] != null) {
					return JsonConvert.SerializeObject(new {
						result = new {
							email = true,
							nav = false
						},
						user = new {
							id = user.ID,
							name = user.name,
							userRole = userType,
							userPhoto = user.Photo
						}
					});
				}
                Session["id"] = user.ID;
				Session["userRole"] = (int)user.UserRole;
				var img = ImageConverter.convertPhotoToString(user.Photo);
				Session["userPhoto"] = img;
				Session["userName"] = user.name;
				Session["userPhoneNumber"] = user.Mobile;
				Session["userEmail"] = user.Email;
				Session["userDescription"] = user.Description;
				return JsonConvert.SerializeObject(new {
					result = new {
						email = true,
						nav = true
					},
					user = new {
						id = user.ID,
						name = user.name,
						userRole = userType,
						userPhoto = user.Photo
					}
				});
			}
		}

		public String getUser(int userId) {
			User u = db.userTable.Find(userId);
			return JsonConvert.SerializeObject(new {
				userPhoto = u.Photo,
				userName = u.name,
				userBio = u.Description,
				userRole = Enum.GetName(typeof(userRole), u.UserRole)
			}, Formatting.Indented);
		}
	}
}
