function ChatPage() {
    return (
      <div className="d-flex flex-column h-100 w-100 ms-2">
        <div className="mb-3">
          <button className="btn btn-1-${theme}">Novo</button>
        </div>
  
        <div className="chat chat-${theme} h-100 w-100 d-flex flex-row">
          <div className="col-3 chat-list-${theme}" style={{ overflowY: 'auto', height: '100%' }}>
          </div>
  
          <div className="col-9" style={{ height: '100%' }}>
          </div>
        </div>
      </div>
    );
}

export default ChatPage;