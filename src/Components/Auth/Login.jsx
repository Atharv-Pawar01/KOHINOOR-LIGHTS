import React, { useContext, useState } from 'react';
import { UserContext } from '../../authContext/userContext';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';

const Login = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [loading,setLoading]=useState(false);


    const navigate=useNavigate()
    const {login} = useContext(UserContext)

    const handleUsernameChange = (e) => {
        setUsername(e.target.value.toUpperCase());
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true)

        
        try {
          const res =await window.electron.invoke('login',{username,password})
    
        //   console.log(res)
     
          // console.log(res.ok)
          if(!res.success)
          {
            throw new Error("something went wrong")
          }

          login(res)
    
        
    
          
          setLoading(false)

          toast.success(res.message)
    
          navigate('/')
          
        } catch (error) {

            // toast.error(error)
          
          toast.error(error.message)
    
          setLoading(false)
        }
    };

    return (
        <div className="flex justify-center items-center h-screen bg-gray-100">
            <div className="bg-white p-8 rounded-lg shadow-lg w-80">
                <h2 className="text-2xl font-bold mb-4 text-center">Login</h2>
                <form onSubmit={handleSubmit}>
                    <div className="mb-4">
                        <label className="block text-gray-700 text-sm font-bold mb-2">Username</label>
                        <input 
                            type="text" 
                            value={username} 
                            onChange={handleUsernameChange} 
                            className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            required
                        />
                    </div>
                    <div className="mb-4">
                        <label className="block text-gray-700 text-sm font-bold mb-2">Password</label>
                        <input 
                            type="password" 
                            value={password} 
                            onChange={(e) => setPassword(e.target.value)} 
                            className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            required
                        />
                    </div>
                    <button 
                        type="submit" 
                        className="w-full bg-blue-500 text-white p-2 rounded-md hover:bg-blue-600"
                    >
                        Login
                    </button>
                </form>
            </div>
        </div>
    );
};

export default Login;
