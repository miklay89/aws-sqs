import shops from "../libs/shops";

export default function shopIdChecker(shopId: string) {
  return shops.find((element) => element.shopId === shopId);
}
