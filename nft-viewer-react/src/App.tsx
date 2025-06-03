import NFTViewer from "./components/NFTViewer";
import { ToastContainer } from 'react-toastify';


function App() {
  return (
    <div>
      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />
      <NFTViewer />
    </div>
  );
}

export default App;
