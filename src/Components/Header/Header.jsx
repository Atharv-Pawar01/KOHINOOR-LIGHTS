import { useState, useRef, useEffect, useContext } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { UserContext } from "../../authContext/userContext";
import { toast } from "react-toastify";
import { ChevronDown, User, LogOut } from "lucide-react";
// ✅ Define menu structure with access control


const Header = () => {
  const [activeIndex, setActiveIndex] = useState(0); // Active main menu index
  const [openSubmenuIndex, setOpenSubmenuIndex] = useState(-1); // Open submenu index (-1 = closed)
  const [submenuItemIndex, setSubmenuItemIndex] = useState(-1); // Active submenu item (-1 = none)
  const [profileOpen, setProfileOpen] = useState(false);
  
  const {user,logout}=useContext(UserContext)

  
  

const navLinks = [
  { path: "/", display: "Home" },

  user?.master || user?.view
    ? {
        path: "/labours",
        display: "Labours",
        submenu: [
          user?.adding ? { path: "add", display: "Add" } : null,
          user?.modify ? { path: "modify", display: "Modify" } : null,
          user?.view ? { path: "view", display: "View" } : null,
        ].filter(Boolean), // Remove null values
      }
    : null,

  user?.master || user?.view
    ? {
        path: "/materials",
        display: "Materials",
        submenu: [
          user?.adding ? { path: "add", display: "Add" } : null,
          user?.modify ? { path: "modify", display: "Modify" } : null,
          user?.view ? { path: "view", display: "View" } : null,
        ].filter(Boolean),
      }
    : null,

  user?.inward || user?.outward || user?.view
    ? {
        path: "/actions",
        display: "Actions",
        submenu: [
          user?.inward ? { path: "inward", display: "Inward" } : null,
          user?.outward ? { path: "outward", display: "Outward" } : null,
          user?.view ? { path: "reports", display: "Reports" } : null,
        ].filter(Boolean),
      }
    : null,

  user?.master || user?.role==="admin"
    ? {
        path: "/master",
        display: "Master",
        submenu: [
          { path: "department", display: "Department" },
          { path: "worker", display: "Worker" },
          { path: "accessibility", display: "Access" },
        ],
      }
    : null,
].filter(Boolean); // Remove null values

  const navRefs = useRef([]); // Store refs for main menu
  const submenuRefs = useRef([]); // Store refs for submenu


  const navigate = useNavigate(); // Use React Router navigation


  useEffect(() => {
    // console.log("User data changed:", user);
  }, [user]); 

  // Auto focus on main menu or submenu item
  useEffect(() => {
    if (openSubmenuIndex === -1 && navRefs.current[activeIndex]) {
      navRefs.current[activeIndex].focus();
    } else if (openSubmenuIndex !== -1 && submenuItemIndex !== -1 && submenuRefs.current[submenuItemIndex]) {
      submenuRefs.current[submenuItemIndex].focus();
    }
  }, [activeIndex, openSubmenuIndex, submenuItemIndex]);

  const handleProfileClick = () => {
    setProfileOpen((prev) => !prev);
  };

  const handleKeyDown = (e) => {
    e.preventDefault(); // Prevent arrow keys from scrolling the page
  
    if (openSubmenuIndex === -1) {
      // Main menu navigation
      if (e.key === "ArrowRight") {
        const newIndex = (activeIndex + 1) % navLinks.length;
        setActiveIndex(newIndex);
        if (navLinks[newIndex].submenu) {
          setOpenSubmenuIndex(newIndex);
          setSubmenuItemIndex(0);
        }
      } else if (e.key === "ArrowLeft") {
        const newIndex = (activeIndex - 1 + navLinks.length) % navLinks.length;
        setActiveIndex(newIndex);
        if (navLinks[newIndex].submenu) {
          setOpenSubmenuIndex(newIndex);
          setSubmenuItemIndex(0);
        }
      } else if (e.key === "Enter" && navLinks[activeIndex].submenu) {
        setOpenSubmenuIndex(activeIndex); // Open submenu
        setSubmenuItemIndex(0);
      }
    } else {
      // Submenu navigation
      const submenuItems = navLinks[openSubmenuIndex].submenu;
      if (e.key === "ArrowDown") {
        setSubmenuItemIndex((prev) => (prev + 1) % submenuItems.length);
      } else if (e.key === "ArrowUp") {
        setSubmenuItemIndex((prev) => (prev - 1 + submenuItems.length) % submenuItems.length);
      } else if (e.key === "Enter" && submenuItemIndex !== -1) {
        // Navigate to selected submenu item
        navigate(`${navLinks[openSubmenuIndex].path}/${submenuItems[submenuItemIndex].path}`);
  
        // ✅ Close the menu after selection
        setOpenSubmenuIndex(-1);
        setSubmenuItemIndex(-1);
      } else if (e.key === "Escape") {
        setOpenSubmenuIndex(-1);
        setSubmenuItemIndex(-1);
      } else if (e.key === "ArrowRight") {
        const newIndex = (activeIndex + 1) % navLinks.length;
        setActiveIndex(newIndex);
        setOpenSubmenuIndex(-1);
        setSubmenuItemIndex(-1);
        if (navLinks[newIndex].submenu) {
          setOpenSubmenuIndex(newIndex);
          setSubmenuItemIndex(0);
        }
      } else if (e.key === "ArrowLeft") {
        const newIndex = (activeIndex - 1 + navLinks.length) % navLinks.length;
        setActiveIndex(newIndex);
        setOpenSubmenuIndex(-1);
        setSubmenuItemIndex(-1);
        if (navLinks[newIndex].submenu) {
          setOpenSubmenuIndex(newIndex);
          setSubmenuItemIndex(0);
        }
      }
    }
  };



  const handleLogout = async () => {

    try {
      const res=await window.electron.invoke("logout");

      if(!res.success)
        throw Error(res.message)

      logout();
      toast.success(res.message)
      navigate("/login")

    } catch (error) {
      toast.error(error)
    }
   
    
    setProfileOpen(false);
    navigate("/login");
  };
  
  

  // Handle submenu opening on hover
  const handleMouseEnter = (index) => {
    if (navLinks[index].submenu) {
      setOpenSubmenuIndex(index);
      setSubmenuItemIndex(0);
    }
  };

  // Close submenu when mouse leaves
  const handleMouseLeave = () => {
    setOpenSubmenuIndex(-1);
    setSubmenuItemIndex(-1);
  };

  return (
    

    <header className="fixed top-0 left-0 w-full z-50 bg-blue-600 shadow-md">
      <div className="container mx-auto flex items-center justify-between h-[50px] px-4">
        {/* Navigation */}
        <nav className="flex gap-5" tabIndex="0" onKeyDown={handleKeyDown}>
          {navLinks.map((link, index) => (
            <div
              key={index}
              className="relative group"
              onMouseEnter={() => handleMouseEnter(index)}
              onMouseLeave={handleMouseLeave}
            >
              <NavLink
                to={link.path}
                ref={(el) => (navRefs.current[index] = el)}
                className={`h-[40px] flex items-center px-4 text-white font-medium rounded-lg hover:bg-blue-700 transition-all duration-200 ease-in-out ${
                  index === activeIndex ? "bg-blue-800 shadow-md" : ""
                }`}
              >
                {link.display}
              </NavLink>
    
              {/* Submenu Dropdown */}
              {link.submenu && openSubmenuIndex === index && (
                <div className="absolute left-0 top-full bg-white shadow-lg rounded-lg w-[180px] mt-2">
                  <ul className="py-2">
                    {link.submenu.map((option, subIndex) => (
                      <li key={subIndex}>
                        <button
                          ref={(el) => (submenuRefs.current[subIndex] = el)}
                          className="block px-4 py-2 w-full text-gray-700 text-left hover:bg-gray-100 transition-all duration-150"
                          onClick={() => navigate(`${link.path}/${option.path}`)}
                          // to={`${link.path}/${option.path}`}
                        >
                          <NavLink
                          to={`${link.path}/${option.path}`}
                          >
                          {option.display}

                          </NavLink>
                          
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ))}
        </nav>
    
        {/* Profile Section */}
        <div className="relative">
          <button
            onClick={handleProfileClick}
            className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-all duration-200"
          >
            <User size={18} className="text-gray-700" />
            <span className="font-medium">{user ? user.name : "Guest"}</span>
            <ChevronDown size={18} className="text-gray-700" />
          </button>
    
          {/* Profile Dropdown */}
          {profileOpen && (
            <div className="absolute right-0 mt-2 bg-white shadow-lg rounded-lg w-[160px]">
              <ul className="py-2">
                {user ? (
                  <>
                    {/* <li>
                      <button className="block px-4 py-2 w-full text-left text-gray-700 hover:bg-gray-100 transition-all">
                        Profile
                      </button>
                    </li> */}
                    <li>
                      <button
                        onClick={handleLogout}
                        className=" px-4 py-2 w-full text-left text-gray-700 hover:bg-gray-100 flex items-center gap-2"
                      >
                        <LogOut size={18} className="text-red-500" />
                        Logout
                      </button>
                    </li>
                  </>
                ) : (
                  <li>
                    <button
                      onClick={() => navigate("/login")}
                      className="block px-4 py-2 w-full text-left text-gray-700 hover:bg-gray-100 transition-all"
                    >
                      Login
                    </button>
                  </li>
                )}
              </ul>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
