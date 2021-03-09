import { Injectable } from '@angular/core';
import { Socket } from "ngx-socket-io";

export class SocketService extends Socket {
  public baseUrl: string = "";
  public convo: any = null;
  public convos: any = null;
  public messages: any = null;
  public currentConvo: any = null;

  /**
   * this is the user id from log in token
   * this is set wright after this instance called
   */
  public userIdFromToken: any = null;

  /**
   * this is the user id set by the the function called
   * by default this is set to null
   */
  public currentLogedInUserId: any = null;
  public apiToken: any = null;
  public devicetoken: any = null;
  public deviceid: any = null;
  public event_id: any = null;
  public chat_with_id: any = null;

  public active_users: any = {};

  /* this is used on tabs msg badge */
  public unread_msg: any = {};

  constructor(params: any = {}) {
    super(params);
    this.listeners();
  }

  setVar(key, val) {
    this[key] = val;
    return this;
  }

  listeners() {
    setInterval(f => {
      this.emit("all active users", this.userIdFromToken);
    }, 120000);

    this.on('disconnect', disconnectionCause => {
      console.log('Disconnection cause: ', disconnectionCause);
    });

    this.on("get convo", data => {
      this.convo = data.data;
      console.log("CONVO: ", this.convo);
      // this.getMessages();
    });
    this.on("all active users", data => {
      this.active_users = data;
    });
    this.on("active user", data => {
      this.active_users["user_id_" + data] = true;
      console.log("added user:", data);
      console.log("active users:", this.active_users);
    });

    this.on("messages", data => {
      this.messages = data;
      console.log("MESSAGES: ", data);
    });

    this.on("inactive user", data => {
      delete this.active_users["user_id_" + data];
      // console.log("removed user:", data);
      // console.log("active users:", this.active_users);
    });

    this.on("get convos", data => {
      console.log("SOCKET CONVO", data);
      this.setConvos(data);
    });

    this.removeListener("chat message badge");
    this.on("chat message badge", data => {
      let eKey = "event_" + data.event_id;
      let cKey = "convo_" + data.convo_id;

      if (!this.unread_msg[eKey]) {
        this.unread_msg[eKey] = {};
      }

      if (!this.unread_msg[eKey]["convos"]) {
        this.unread_msg[eKey]["convos"] = {};
      }

      this.unread_msg[eKey]["convos"][cKey] = true;
      this.unread_msg[eKey]["unread_msg_convo"] = Object.keys(
        this.unread_msg[eKey]["convos"]
      ).length;
    });
  }

  setConvos(data, c: any = null) {
    if (!c) {
      this.convos = this.setConverseWith(data.data);
    } else {
      /* todo infinite scroll */
      console.log("infi", data, c);

      // if(data.data.current_page == 1 || data.data.current_page){
      //   this.convos = this.setConverseWith(data.data);
      // } else {
      // }
    }
  }

  /**
   * loop through the convo data to set the delegate to display
   * @param data
   */
  setConverseWith(data) {
    data.datas.forEach((val, key) => {
      data.datas[key] = this.setConverseWithHelper(val);
    });
    return data;
  }

  /**
   * sort the convos in newest message first
   */
  sortConvos() {
    let convos = this.convos.datas;
    let _c = [];
    convos.forEach(c => {
      if (c.unread) {
        _c.unshift(c);
      } else {
        _c.push(c);
      }
    });
    this.convos.datas = _c;
  }

  /**
   * set the delegate to display on specific convo
   * @param convo
   */
  setConverseWithHelper(convo, isNew: boolean = false) {
    let d = 2;
    if (this.currentLogedInUserId == convo.user2) {
      d = 1;
    }
    convo["fullname"] = convo["d" + d + "_fullname"];
    convo["company"] = convo["com" + d + "_name"];
    convo["company"] = convo["com" + d + "_name"];
    convo["userid"] = convo["user" + d];

    if (convo["up" + d + "_profile_pic"]) {
      convo["profile_photo"] = convo["up" + d + "_profile_pic"];
    } else {
      convo["profile_photo"] = convo["d" + d + "_profile_photo"];
    }

    if (isNew && this.currentLogedInUserId != convo.last_message_by) {
      convo["unread"] = true;
    }
    return convo;
  }

  /**
   * this will going to emit the action the server js
   * to retreive all conversation of loged in user
   */
  getConvos(page: any = 1) {
    if (page == 1) {
      this.convos = null;
    }
    let param = {
      token: this.apiToken,
      baseUrl: this.baseUrl,
      uripath: "/api/chat/getconvos",
      userid: this.currentLogedInUserId,
      Devicetoken: this.devicetoken
    };
    let form = {
      request_type: "mobile",
      event_id: this.event_id,
      userid: this.currentLogedInUserId,
      token: this.apiToken,
      page: page
    };
    let data = {
      param: param,
      form: form
    };
    this.emit("get convos", data);
  }

  /**
   * get the conversation of delegate
   */
  getConvo(page = 1, convoId?) {
    let param = {
      token: this.apiToken,
      baseUrl: this.baseUrl,
      uripath: "/api/chat/getconvo",
      userid: this.currentLogedInUserId,
      Devicetoken: this.devicetoken
    };
    let form = {
      request_type: "mobile",
      token: this.apiToken,
      convoId: convoId ? convoId : null,
      page: page
    };

    let data = {
      form: form,
      param: param
    };
    console.log("EMIT GET CONVO", data);

    this.emit("echo", "YOW from IONIC");

    this.emit("get convo", data);
  }

  deleteConvo(convoId) {
    let param = {
      token: this.apiToken,
      baseUrl: this.baseUrl,
      uripath: "/api/chat/getconvo",
      userid: this.currentLogedInUserId,
      Devicetoken: this.devicetoken,
    };
    let form = {
      request_type: "mobile",
      token: this.apiToken,
      convoId: convoId,
      isDeleted: 'hotdog',
    };

    let data = {
      form: form,
      param: param
    };

    this.emit("delete convo", data);
  }

  sendMessage(message, otherid, convoid, attachmentid?, temp_id?) {
    console.log(temp_id);
    let param = {
      token: this.apiToken,
      baseUrl: this.baseUrl,
      uripath: "/api/chat/savemessage",
      userid: this.currentLogedInUserId,
      Devicetoken: this.devicetoken,
      currentConvo: this.currentConvo,
      temp_id : temp_id
    };

    let form = {
      request_type: "mobile",
      senderid: this.currentLogedInUserId,
      receiverid: otherid,
      msg: message,
      convoid: convoid,
      attachmentIds: attachmentid
    };

    let data = {
      form: form,
      param: param
    };

    this.emit("chat message", data);
  }

  /**
   * get the message in conversation
   */
  getMessages(into: string = "append", _page: any = 1) {
    let param = {
      token: this.apiToken,
      baseUrl: this.baseUrl,
      uripath: "/api/chat/messages",
      userid: this.currentLogedInUserId,
      into: into,
      Devicetoken: this.devicetoken
    };

    let form = {
      request_type: "mobile",
      token: this.apiToken,
      convoid: this.convo.id,
      page: _page
    };

    let data = {
      form: form,
      param: param
    };

    this.emit("messages", data);
  }

  chatting(convoId) {
    this.emit("chatting", convoId);
  }

  getMessagesV2(convoid, into: string = "append", _page: any = 1) {
    let param = {
      token: this.apiToken,
      baseUrl: this.baseUrl,
      uripath: "/api/chat/messages",
      userid: this.currentLogedInUserId,
      into: into,
      Devicetoken: this.devicetoken
    };

    let form = {
      request_type: "mobile",
      token: this.apiToken,
      convoid: convoid,
      page: _page
    };

    let data = {
      form: form,
      param: param
    };

    this.emit("messages", data);
  }
}
