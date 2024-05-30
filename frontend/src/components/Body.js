import React from 'react'
import {createBrowserRouter,RouterProvider} from 'react-router-dom'
import Home from './Home'
// import Profile from './Profile'

import Saved from './Saved'
import Login from './Login'
import Content from './Content'
import Daily from './Daily'
const Body = () => {
    const appRouter = createBrowserRouter([
      {
        path:'/',
        element: <Home />,
        children: [
          {
            path:'/',
            element: <Content/>,
            children:[
              {
                path:'/',
              element: <Daily/>,
              },
              {
                path:'/saved',
                element: <Saved/>
              }

            ]
          }
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