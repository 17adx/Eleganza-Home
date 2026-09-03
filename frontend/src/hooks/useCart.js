import { useContext } from "react";

import { CartContext } from "../contexts/CartContext/CartContextDefinition";

const useCart = () => useContext(CartContext);

export default useCart;
