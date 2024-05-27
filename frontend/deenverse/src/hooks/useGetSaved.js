// import axios from "axios";
// import { USER_API_END_POINT } from "../utils/constant";
// import { useEffect } from "react";
// import { useDispatch } from "react-redux";
// import { getMySaved } from "../redux/userSlice";
// const useGetSaved = (id) => {
//     const dispatch = useDispatch();
//     useEffect(() => {
//       const fetchMySaved= async () =>{
//         try {
//             const res = await axios.get(`${USER_API_END_POINT}/getprofile/${id}`, {
//                 withCredentials: true,
//             });
//             dispatch(getMySaved(res.data.user));
//         } catch (error) {
//             console.log(error);
//         }
    
//       }
//       fetchMySaved();
//     }, []);
        
// };
// export default useGetSaved;
