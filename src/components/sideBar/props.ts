export interface SideBarProps {
  active: boolean;
  setActive: (value: boolean | ((prevVar: boolean) => boolean)) => void;
}
