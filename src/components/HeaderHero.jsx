import Logo from "./Logo.jsx";
import NavMenu from "./NavMenu.jsx";
import MenuToggle from "./MenuToggle.jsx";

export default function HeaderHero({ onMenuClick }) {
  return (
    <header
      className="absolute top-[60px] left-0 right-0 h-[64px] z-30 flex items-center bg-[var(--color-overlay-light-10)] backdrop-blur-[2px] px-6 md:px-10 lg:px-[100px] xl:px-[260px] anim-header-slide-in"
    >
      <div className="flex flex-1 items-center justify-between gap-8">
        <Logo />
        <div className="hidden lg:flex items-center gap-[30px]">
          <NavMenu size={16} />
        </div>
      </div>
      <div className="ml-6">
        <MenuToggle onClick={onMenuClick} accent="red" />
      </div>
    </header>
  );
}
