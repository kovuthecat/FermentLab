import { createBrowserRouter } from "react-router-dom";
import App from "./App";
import DashboardPage from "../features/batches/pages/DashboardPage";
import CreateBatchPage from "../features/batches/pages/CreateBatchPage";
import BatchDetailPage from "../features/batches/pages/BatchDetailPage";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    children: [
      { index: true, element: <DashboardPage /> },
      { path: "batches/new", element: <CreateBatchPage /> },
      { path: "batches/:batchId", element: <BatchDetailPage /> },
    ],
  },
]);
