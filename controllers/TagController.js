const TagService = require('../services/TagService');

const createTagController = async (req, res) => {
  const { name, color, schema } = req.body;
  try {
    const tag = await TagService.createTag(name, color, schema);
    res.status(201).json(tag);
  } catch (error) {
    res.status(500).json({ error: 'erro ao criar tag' });
  }
};

const getTagsController = async (req, res) => {
  const { schema } = req.params;
  try {
    const tags = await TagService.getTags(schema);
    res.json(tags);
  } catch (error) {
    res.status(500).json({ error: 'erro ao buscar tags' });
  }
};

const deleteTagController = async (req, res) => {
  const { tagId, schema } = req.params;
  try {
    await TagService.deleteTag(tagId, schema);
    res.sendStatus(204);
  } catch (error) {
    res.status(500).json({ error: 'erro ao deletar tag' });
  }
};

const addTagToChatController = async (req, res) => {
  const { chatId, tagId, schema } = req.body;
  try {
    await TagService.addTagToChat(chatId, tagId, schema);
    res.sendStatus(200);
  } catch (error) {
    res.status(500).json({ error: 'erro ao adicionar tag ao chat' });
  }
};

const removeTagFromChatController = async (req, res) => {
  const { chatId, tagId, schema } = req.body;
  try {
    await TagService.removeTagFromChat(chatId, tagId, schema);
    res.sendStatus(200);
  } catch (error) {
    res.status(500).json({ error: 'erro ao remover tag do chat' });
  }
};

const getTagsByChatController = async (req, res) => {
  const { chatId, schema } = req.params;
  try {
    const tags = await TagService.getTagsByChat(chatId, schema);
    res.json(tags);
  } catch (error) {
    res.status(500).json({ error: 'erro ao buscar tags do chat' });
  }
};

module.exports = {
  createTagController,
  getTagsController,
  deleteTagController,
  addTagToChatController,
  removeTagFromChatController,
  getTagsByChatController,
};