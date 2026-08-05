import WeaponDecoration from "./WeaponDecoration";

/** Decorative floating sword — delegates all logic to WeaponDecoration. */
export default function SwordCursor() {
  return (
    <WeaponDecoration
      weapon="sword"
      src="/img/sword.png"
      intrinsic={300}
      sizeClass="w-16 sm:w-20"
      animClass="animate-sword"
      auraColor="rgba(220,38,38,0.22)"
      auraHover="rgba(220,38,38,0.60)"
      label="Take the sword in hand"
      hoverTitle="Take up the blade"
      hoverSub="Only the cursed may wield it"
      wieldedMsg="The blade is yours."
    />
  );
}
