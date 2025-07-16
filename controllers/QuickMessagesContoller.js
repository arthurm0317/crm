const { createQuickMessage, getAllQuickMessages, getQuickMessageById, updateQuickMessage, deleteQuickMessage, getAllQuickMessagesByUser } = require("../services/QuickMessagesService")

const createQuickMessageController = async (req, res) => {
    const {type, queue_id, user_id, message, is_command_on, shortcut, schema} = req.body
    try {
        const result = await createQuickMessage(type, queue_id, user_id, message, is_command_on, shortcut, schema)
        res.status(201).json({
            success: true,
            result
        })
    } catch (error) {
        console.error(error)
        res.status(400).json({
            success:false,
        })
    }
}

const getAllQuickMessagesController = async (req, res) => {
    const {schema} = req.params
    try {
        const result = await getAllQuickMessages(schema)
        res.status(200).json({
            success:true,
            result
        })
    } catch (error) {
        console.error(error)
        res.status(400).json({
            success:false,
        })
    }
}

const getQuickMessageByIdController = async (req, res) => {
    const {quick_message_id, schema} = req.params
    try {
        const result = await getQuickMessageById(quick_message_id, schema)
        res.status(200).json({
            success:true,
            result
        })
    } catch (error) {
        console.error(error)
        res.status(400).json({
            success:false,
        })
    }
}

const updateQuickMessageController = async (req, res) => {
    const {quick_message_id, message, type, queue_id, shortcut, schema} = req.body
    try {
        const result = await updateQuickMessage(quick_message_id, type, queue_id, message, shortcut, schema)
         res.status(200).json({
            success:true,
            result
        })
    } catch (error) {
        console.error(error)
        res.status(400).json({
            success:false,
        })
    }
}
const deleteQuickMessageController = async (req, res) => {
    const {quick_message_id, schema} =req.params
    try {
        await deleteQuickMessage(quick_message_id, schema)
         res.status(200).json({
            success:true,
        })
    } catch (error) {
        console.error(error)
         res.status(400).json({
            success:false,
        })
    }
}

const getAllQuickMessagesByUserController = async (req, res) => {
    const{user_id, schema} = req.params
    try {
        const result = await getAllQuickMessagesByUser(user_id, schema)
        res.status(200).json({
            success:true,
            result
        })
    } catch (error) {
         console.error(error)
         res.status(400).json({
            success:false,
        })
    }
}

module.exports={
    createQuickMessageController,
    getAllQuickMessagesController,
    getQuickMessageByIdController,
    updateQuickMessageController,
    deleteQuickMessageController,
    getAllQuickMessagesByUserController
}