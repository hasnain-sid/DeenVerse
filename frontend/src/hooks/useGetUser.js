import axios from "axios";
import { USER_API_END_POINT } from "../utils/constant";
import { useEffect } from "react";
import { useDispatch , useSelector} from "react-redux";
import { getUser } from "../redux/userSlice";
const useGetUser = () => {
    const dispatch = useDispatch();
    const {refresh,user} = useSelector(store=>store.user);

    useEffect(() => {
      // const fetchMySaved= async () =>{
      //   try {
      //       const res = await axios.get(`${USER_API_END_POINT}/saved/${id}`, {
      //           withCredentials: true,
      //       });
      //       dispatch(getMySaved(res.data.saved));
      //   } catch (error) {
      //       console.log(error);
      //   }
    
      // }
      // fetchMySaved();
      console.log('he')
      dispatch(getUser(user));
    }, [refresh]);
        
};
export default useGetUser;
