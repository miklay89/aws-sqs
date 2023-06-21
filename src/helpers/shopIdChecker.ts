import shops from "../libs/shops";

export default function shopIdChecker(shopId: string) {
  return shops.some((element) => element.shopId === shopId);
}
