import React from "react";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import Home from "./Home";
// import Profile from './Profile'

import Saved from "./Saved";
import Login from "./Login";
import Content from "./Content";
import Daily from "./Daily";
import QuranLearningHome from "./QuranLearningHome";
import QuranLearning from "./QuranLearning";
import QuranLearningSession from "./QuranLearningSession";
import QuranLearningMinimalist from "./QuranLearningMinimalist";
import QuranExplorer from "./QuranExplorer";

const Body = () => {
  const appRouter = createBrowserRouter([
    {
      path: "/",
      element: <Home />,
      children: [
        {
          path: "/",
          element: <Content />,
          children: [
            {
              path: "/",
              element: <Daily />,
            },
            {
              path: "/saved",
              element: <Saved />,
            },
            {
              path: "/quran-learning",
              element: <QuranLearningHome />,
            },
          ],
        },
      ],
    },
    {
      path: "/login",
      element: <Login />,
    },    {
      path: "/quran-learning/session",
      element: <QuranLearningSession />,
    },
    {
      path: "/quran-learning/minimalist",
      element: <QuranLearningMinimalist />,
    },
    {
      path: "/quran-learning/explorer",
      element: <QuranExplorer />,
    },
  ]);
  return (
    <div>
      <RouterProvider router={appRouter} />
    </div>
  );
};

export default Body;
