import { Route, Routes } from "react-router-dom";
import Home from "../Components/Home/Home";
import LabourForm from "../Components/labourComponent/LabourForm";
import Labour from "../Components/labourComponent/Labour";
import ViewLabours from "../Components/labourComponent/ViewLabours";
import AddMaterial from "../Components/MaterialComponent/AddMaterial";
import Material from "../Components/MaterialComponent/Material";
import ViewMaterials from "../Components/MaterialComponent/ViewMaterials";
import Outward from "../Components/Summary/Outward";
import ModifyLabour from "../Components/labourComponent/ModifyLabour";
import Materials from "../Components/MaterialComponent/Materials";
import Actions from "../Components/Summary/Actions";
import Inward from "../Components/Summary/Inward";
import Department from "../Components/MasterAuthority/Department";
import Worker from "../Components/MasterAuthority/Worker";
import WorkerList from "../Components/MasterAuthority/WorkerList";
import AddWorker from "../Components/MasterAuthority/AddWorker";
import Master from "../Components/MasterAuthority/Master";
import Login from "../Components/Auth/Login";
import View from "../Components/Summary/View"

const Router = () => {
    return (
        <Routes>
            {/* Public Routes */}
            <Route path="/login" element={<Login />} />
            

            {/* Protected Routes with Role-Based Access */}
            {/* <Route element={<ProtectedRoute allowedRoles={["admin", "manager"]} />}> */}
                <Route path="/" element={<Home/>} />
                <Route path="/labours" element={<Labour />} />
                <Route path="/labours/add" element={<LabourForm />} />
                <Route path="/labours/modify" element={<ModifyLabour />} />
                <Route path="/labours/view" element={<ViewLabours />} />
                <Route path="/materials" element={<Materials />} />
                <Route path="/materials/add" element={<AddMaterial />} />
                <Route path="/materials/modify" element={<Material />} />
                <Route path="/materials/view" element={<ViewMaterials />} />
                <Route path="/actions" element={<Actions />} />
            {/* </Route> */}

            {/* <Route element={<ProtectedRoute allowedRoles={["admin"]} />}> */}
                <Route path="/actions/outward" element={<Outward />} />
                <Route path="/actions/inward" element={<Inward />} />
                <Route path="/actions/reports" element={<View/>} />
                <Route path="/master" element={<Master />} />
                <Route path="/master/department" element={<Department />} />
                <Route path="/master/worker" element={<AddWorker />} />
                <Route path="/master/accessibility" element={<WorkerList />} />
            {/* </Route> */}
        </Routes>
    );
};

export default Router;
