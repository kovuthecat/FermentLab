import { createBrowserRouter } from "react-router-dom";
import App from "./App";
import DashboardPage from "../features/batches/pages/DashboardPage";
import CreateBatchPage from "../features/batches/pages/CreateBatchPage";
import BatchDetailPage from "../features/batches/pages/BatchDetailPage";
import ComparisonPage from "../features/comparisons/pages/ComparisonPage";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    children: [
      { index: true, element: <DashboardPage /> },
      { path: "batches/new", element: <CreateBatchPage /> },
      { path: "batches/:batchId", element: <BatchDetailPage /> },
      { path: "comparisons", element: <ComparisonPage /> },
    ],
  },
]);
