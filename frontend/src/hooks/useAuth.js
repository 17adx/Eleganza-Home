import { useContext } from "react";

import { AuthContext } from "../contexts/AuthContext/AuthContextDefinition";

const useAuth = () => useContext(AuthContext);

export default useAuth;
