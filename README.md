# Introduction

Project goal emit a msg via socket to server and call a optional callback on response coresponding the msg.id.

# Usage

Just init the Backbone.Do.Hub and emit a message.

## INITIALIZATION

To configure Backbone.Do you got to init the `Backbone.Do.hub`.

	// you can go with defaults
	Backbone.Do.hub.init();


## MESSAGE HANDLING

### send message

To send message just:

    var do = new Backbone.Do.Req({
        id: '123456'
        // your content
    });

    // emit it
    do.emit();

### observe response

if you want to react on messages in respond you can:

    var do = new Backbone.Do.Req({
        id: '123456'
        // your content
    });

    // emit it and observe
    do.emit(function(res) {
        // do something
    });

or:

    // observe it
    do.observe(function(res) {
    	// do something
    });

    // emit it
    do.emit();

By default backbone.Do will look for a field `commandId` in the event. You can 
override this value or provide a own function to get the commandId in which the event 
was send as response:

	Backbone.CQRS.hub.init({

        requesrId: 'reqId', // override with another value

        // override the getCommandId function
        getRequestId: function(res) {
            return res.reqId.substring(0, res.indexOf('.')); // or whatever
        }
	});

# License

Copyright (c) 2011 Jan Mühlemann

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.