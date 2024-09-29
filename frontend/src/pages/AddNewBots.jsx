// frontend/src/pages/AddNewBots.jsx

import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from '../partials/Sidebar';
import Header from '../partials/Header';

function AddNewBots() {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [botName, setBotName] = useState("");
  const [url2, setUrl2] = useState("");
  const [config, setConfig] = useState({});
  const [botId, setBotId] = useState(null); // State for bot_id
  const [loading, setLoading] = useState(false); // Loading state initialized to false

  const [formData, setFormData] = useState({
    prompt: "",
    heading1: "",
    sub_heading1: "",
    heading2: "",
    sub_heading2: "",
    initial_message: "",
    model: "gpt-3.5-turbo",
    chatbot_video: null,
    chat_icon: null,
    xlt_image: null,
    chatbot_icon: null,
    dataset_pdf: null,
    data_py: null,
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    console.log(`Changing field: ${name} to ${value}`); // Debugging line
    setFormData((prevFormData) => ({
      ...prevFormData,
      [name]: value,
    }));
  };

  const handleFileChange = (e) => {
    const { name, files } = e.target;
    if (files.length > 0) {
      setFormData((prevFormData) => ({
        ...prevFormData,
        [name]: files[0],
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true); // Start loading

    try {
      // Create a new bot
      const createResponse = await fetch('http://localhost:5000/create-bot', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const createData = await createResponse.json();

      if (!createData.success) {
        alert("Error creating bot: " + createData.error);
        setLoading(false);
        return;
      }

      setBotId(createData.bot_id);
      console.log(`New Bot ID: ${createData.bot_id}`);

      // Prepare data to send
      const dataToSend = {
        ...formData,
        botName,
        url2,
      };

      // Update config
      const updateResponse = await fetch(`http://localhost:5000/update-config/${createData.bot_id}`, {
        method: "POST",
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(dataToSend),
      });

      const updateData = await updateResponse.json();

      if (updateData.success) {
        alert(updateData.message);
        navigate(`/bot-details/${createData.bot_id}`);
      } else {
        alert("Error: " + updateData.error);
      }

    } catch (error) {
      console.error("Error:", error);
      alert("An error occurred. Please try again.");
    } finally {
      setLoading(false); // End loading
    }
  };

  const handleUndo = () => {
    if (!botId) {
      alert("Bot ID is not available for undo.");
      return;
    }

    fetch(`http://localhost:5000/undo-config/${botId}`, {
      method: "POST",
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.success) {
          alert(data.message);
          // Optionally navigate or refresh data
        } else {
          alert("Error: " + data.error);
        }
      })
      .catch((error) => {
        console.error("Error:", error);
        alert("An error occurred. Please try again.");
      });
  };

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Sidebar */}
      <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

      {/* Content area */}
      <div className="relative flex flex-col flex-1 overflow-y-auto overflow-x-hidden">
        {/* Site header */}
        <Header sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

        <main className="grow">
          <div className="px-4 sm:px-6 lg:px-8 py-8 w-full max-w-9xl mx-auto">

            {/* Form Container */}
            <div className="max-w-6xl mx-auto bg-white dark:bg-gray-800 shadow-md rounded-lg p-6 md:p-10 space-y-8">
              <div className="flex flex-col md:flex-row justify-between items-center">
                <h1 className="text-3xl font-semibold text-gray-800 dark:text-gray-100 mb-4 md:mb-0">
                  Configure <span className="text-indigo-600">{botName}</span>
                </h1>
                <div className="flex space-x-4">
                  <button
                    id="undoButton"
                    onClick={handleUndo}
                    className="px-4 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600 transition-colors"
                  >
                    Undo Changes
                  </button>
                </div>
              </div>

              <form
                id="updateConfigForm"
                onSubmit={handleSubmit}
                className="space-y-8"
              >
                <div className="space-y-4">
                  <label
                    htmlFor="prompt"
                    className="block font-medium text-gray-700 dark:text-gray-300"
                  >
                    Prompt:
                  </label>
                  <textarea
                    id="prompt"
                    name="prompt"
                    className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-gray-100"
                    value={formData.prompt}
                    onChange={handleInputChange}
                    maxLength={200}
                    placeholder="Enter the prompt here..."
                  ></textarea>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <label
                      htmlFor="heading1"
                      className="block font-medium text-gray-700 dark:text-gray-300"
                    >
                      Heading 1:
                    </label>
                    <input
                      type="text"
                      id="heading1"
                      name="heading1"
                      className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-md bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-gray-100 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      value={formData.heading1}
                      onChange={handleInputChange}
                      placeholder="Enter Heading 1"
                    />
                  </div>
                  <div className="space-y-4">
                    <label
                      htmlFor="sub_heading1"
                      className="block font-medium text-gray-700 dark:text-gray-300"
                    >
                      Sub-heading 1:
                    </label>
                    <input
                      type="text"
                      id="sub_heading1"
                      name="sub_heading1"
                      className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-md bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-gray-100 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      value={formData.sub_heading1}
                      onChange={handleInputChange}
                      placeholder="Enter Sub-heading 1"
                    />
                  </div>
                  <div className="space-y-4">
                    <label
                      htmlFor="heading2"
                      className="block font-medium text-gray-700 dark:text-gray-300"
                    >
                      Heading 2:
                    </label>
                    <input
                      type="text"
                      id="heading2"
                      name="heading2"
                      className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-md bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-gray-100 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      value={formData.heading2}
                      onChange={handleInputChange}
                      placeholder="Enter Heading 2"
                    />
                  </div>
                  <div className="space-y-4">
                    <label
                      htmlFor="sub_heading2"
                      className="block font-medium text-gray-700 dark:text-gray-300"
                    >
                      Sub-heading 2:
                    </label>
                    <input
                      type="text"
                      id="sub_heading2"
                      name="sub_heading2"
                      className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-md bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-gray-100 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      value={formData.sub_heading2}
                      onChange={handleInputChange}
                      placeholder="Enter Sub-heading 2"
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <label
                    htmlFor="initial_message"
                    className="block font-medium text-gray-700 dark:text-gray-300"
                  >
                    Initial Message:
                  </label>
                  <textarea
                    id="initial_message"
                    name="initial_message"
                    className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-gray-100"
                    rows="3"
                    value={formData.initial_message}
                    onChange={handleInputChange}
                    placeholder="Enter the initial message..."
                  ></textarea>
                </div>

                <div className="space-y-4">
                  <label
                    htmlFor="model"
                    className="block font-medium text-gray-700 dark:text-gray-300"
                  >
                    Model:
                  </label>
                  <select
                    id="model"
                    name="model"
                    className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-md bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-gray-100 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    value={formData.model}
                    onChange={handleInputChange}
                  >
                    <option value="gpt-3.5-turbo">gpt-3.5-turbo</option>
                    <option value="gpt-4-1106-preview">gpt-4-1106-preview</option>
                    <option value="gpt-4o">gpt-4o</option>
                  </select>
                </div>

                <div className="space-y-6">
                  <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100">
                    Upload Assets
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* CHATBOT VIDEO */}
                    <div className="space-y-4">
                      <label
                        htmlFor="chatbot_video"
                        className="block font-medium text-gray-700 dark:text-gray-300"
                      >
                        Chatbot Video
                      </label>
                      <label
                        htmlFor="chatbot_video"
                        className="h-32 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-md flex items-center justify-center cursor-pointer bg-gray-50 dark:bg-gray-700 hover:border-indigo-500 transition-colors"
                      >
                        {formData.chatbot_video ? (
                          <p className="text-center text-gray-700 dark:text-gray-200">
                            {formData.chatbot_video.name}
                          </p>
                        ) : (
                          <div className="flex flex-col items-center">
                            <svg
                              className="w-8 h-8 text-gray-500 dark:text-gray-400 mb-2"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                              xmlns="http://www.w3.org/2000/svg"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                              ></path>
                            </svg>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                              Drop video or Browse
                            </p>
                          </div>
                        )}
                        <input
                          type="file"
                          id="chatbot_video"
                          name="chatbot_video"
                          accept="video/*"
                          className="hidden"
                          onChange={handleFileChange}
                        />
                      </label>
                    </div>

                    {/* HEADER ICON */}
                    <div className="space-y-4">
                      <label
                        htmlFor="chat_icon"
                        className="block font-medium text-gray-700 dark:text-gray-300"
                      >
                        Header Icon
                      </label>
                      <label
                        htmlFor="chat_icon"
                        className="h-32 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-md flex items-center justify-center cursor-pointer bg-gray-50 dark:bg-gray-700 hover:border-indigo-500 transition-colors"
                      >
                        {formData.chat_icon ? (
                          <p className="text-center text-gray-700 dark:text-gray-200">
                            {formData.chat_icon.name}
                          </p>
                        ) : (
                          <div className="flex flex-col items-center">
                            <svg
                              className="w-8 h-8 text-gray-500 dark:text-gray-400 mb-2"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                              xmlns="http://www.w3.org/2000/svg"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                              ></path>
                            </svg>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                              Drop image or Browse
                            </p>
                          </div>
                        )}
                        <input
                          type="file"
                          id="chat_icon"
                          name="chat_icon"
                          accept="image/*"
                          className="hidden"
                          onChange={handleFileChange}
                        />
                      </label>
                    </div>

                    {/* CHATBOX CENTER IMAGE */}
                    <div className="space-y-4">
                      <label
                        htmlFor="xlt_image"
                        className="block font-medium text-gray-700 dark:text-gray-300"
                      >
                        Chatbox Center Image
                      </label>
                      <label
                        htmlFor="xlt_image"
                        className="h-32 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-md flex items-center justify-center cursor-pointer bg-gray-50 dark:bg-gray-700 hover:border-indigo-500 transition-colors"
                      >
                        {formData.xlt_image ? (
                          <p className="text-center text-gray-700 dark:text-gray-200">
                            {formData.xlt_image.name}
                          </p>
                        ) : (
                          <div className="flex flex-col items-center">
                            <svg
                              className="w-8 h-8 text-gray-500 dark:text-gray-400 mb-2"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                              xmlns="http://www.w3.org/2000/svg"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                              ></path>
                            </svg>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                              Drop image or Browse
                            </p>
                          </div>
                        )}
                        <input
                          type="file"
                          id="xlt_image"
                          name="xlt_image"
                          accept="image/*"
                          className="hidden"
                          onChange={handleFileChange}
                        />
                      </label>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* CHAT ICON (ROBOT) */}
                    <div className="space-y-4">
                      <label
                        htmlFor="chatbot_icon"
                        className="block font-medium text-gray-700 dark:text-gray-300"
                      >
                        Chat Icon (Robot)
                      </label>
                      <label
                        htmlFor="chatbot_icon"
                        className="h-32 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-md flex items-center justify-center cursor-pointer bg-gray-50 dark:bg-gray-700 hover:border-indigo-500 transition-colors"
                      >
                        {formData.chatbot_icon ? (
                          <p className="text-center text-gray-700 dark:text-gray-200">
                            {formData.chatbot_icon.name}
                          </p>
                        ) : (
                          <div className="flex flex-col items-center">
                            <svg
                              className="w-8 h-8 text-gray-500 dark:text-gray-400 mb-2"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                              xmlns="http://www.w3.org/2000/svg"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                              ></path>
                            </svg>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                              Drop image or Browse
                            </p>
                          </div>
                        )}
                        <input
                          type="file"
                          id="chatbot_icon"
                          name="chatbot_icon"
                          accept="image/*"
                          className="hidden"
                          onChange={handleFileChange}
                        />
                      </label>
                    </div>

                    {/* Dataset PDF */}
                    <div className="space-y-4">
                      <label
                        htmlFor="dataset_pdf"
                        className="block font-medium text-gray-700 dark:text-gray-300"
                      >
                        Dataset PDF
                      </label>
                      <label
                        htmlFor="dataset_pdf"
                        className="h-32 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-md flex items-center justify-center cursor-pointer bg-gray-50 dark:bg-gray-700 hover:border-indigo-500 transition-colors"
                      >
                        {formData.dataset_pdf ? (
                          <p className="text-center text-gray-700 dark:text-gray-200">
                            {formData.dataset_pdf.name}
                          </p>
                        ) : (
                          <div className="flex flex-col items-center">
                            <svg
                              className="w-8 h-8 text-gray-500 dark:text-gray-400 mb-2"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                              xmlns="http://www.w3.org/2000/svg"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"
                              ></path>
                            </svg>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                              Drop PDF or Browse
                            </p>
                          </div>
                        )}
                        <input
                          type="file"
                          id="dataset_pdf"
                          name="dataset_pdf"
                          accept=".pdf"
                          className="hidden"
                          onChange={handleFileChange}
                        />
                      </label>
                    </div>

                    {/* Data.py File */}
                    <div className="space-y-4">
                      <label
                        htmlFor="data_py"
                        className="block font-medium text-gray-700 dark:text-gray-300"
                      >
                        Data.py File
                      </label>
                      <label
                        htmlFor="data_py"
                        className="h-32 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-md flex items-center justify-center cursor-pointer bg-gray-50 dark:bg-gray-700 hover:border-indigo-500 transition-colors"
                      >
                        {formData.data_py ? (
                          <p className="text-center text-gray-700 dark:text-gray-200">
                            {formData.data_py.name}
                          </p>
                        ) : (
                          <div className="flex flex-col items-center">
                            <svg
                              className="w-8 h-8 text-gray-500 dark:text-gray-400 mb-2"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                              xmlns="http://www.w3.org/2000/svg"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M14 10l-2 1m0 0l-2-1m2 1v2.5M20 7l-2 1m2-1l-2-1m2 1v2.5M14 4l-2-1-2 1M4 7l2-1M4 7l2 1M4 7v2.5M12 21l-2-1m2 1l2-1m-2 1v-2.5M6 18l-2-1v-2.5M18 18l2-1v-2.5"
                              ></path>
                            </svg>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                              Drop Python file or Browse
                            </p>
                          </div>
                        )}
                        <input
                          type="file"
                          id="data_py"
                          name="data_py"
                          accept=".py"
                          className="hidden"
                          onChange={handleFileChange}
                        />
                      </label>
                    </div>
                  </div>
                </div>

                <div className="flex justify-center">
                  <button
                    type="submit"
                    className="px-6 py-3 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    Save Configuration
                  </button>
                </div>
              </form>
            </div>

          </div>
        </main>

        {/* Optional Banner */}
        {/* <Banner /> */}

      </div>
    </div>
  );
}

export default AddNewBots;