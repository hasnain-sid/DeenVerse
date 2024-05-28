import React from 'react'
import {createBrowserRouter,RouterProvider} from 'react-router-dom'
import Home from './Home'
// import Profile from './Profile'
import Login from './Login'
import Content from './Content'
const Body = () => {
    const appRouter = createBrowserRouter([
      {
        path:'/',
        element: <Home />,
        children: [
          {
            path:'/',
            element: <Content/>
          },
          // {
          //   path:'/profile',
          //   element: <Profile/>
          // }
        ]
        
      },
      {
        path:'/login',
        element: <Login/>
      }


    ])
  return (
    <div>
      <RouterProvider router={appRouter}/>
    </div>
  )
}

export default Body