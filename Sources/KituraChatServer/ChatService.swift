/**
 * Copyright IBM Corporation 2016
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 **/

// KituraChatServer is a very simple chat server

import Foundation

import KituraWebSocket

class ChatService: WebSocketService {
    
    private var clients = [String: (String, WebSocketClient)]()
    
    /// Called when a WebSocket client connects to this service.
    ///
    /// - Parameter client: The `WebSocketClient` object that represents the client that
    ///                    connected to this service
    public func connected(client: WebSocketClient) {
        // Ignored
    }
    
    /// Called when a WebSocket client disconnects from this service.
    ///
    /// - Parameter client: The `WebSocketClient` object that represents the client that
    ///                    disconnected from this service.
    /// - Paramater reason: The `WebSocketCloseReasonCode` that describes why the client disconnected.
    public func disconnected(client: WebSocketClient, reason: WebSocketCloseReasonCode) {
        clients.removeValue(forKey: client.id)
    }
    
    /// Called when a WebSocket client sent a binary message to this service.
    ///
    /// - Parameter message: A Data struct containing the bytes of the binary message sent by the client.
    /// - Parameter client: The `WebSocketClient` object that represents the client that
    ///                    sent the message to this service
    public func received(message: Data, from: WebSocketClient) {
        from.close(reason: .invalidDataType, description: "Kitura-Chat-Server only accepts text messages")
        clients.removeValue(forKey: from.id)
    }
    
    /// Called when a WebSocket client sent a text message to this service.
    ///
    /// - Parameter message: A String containing the text message sent by the client.
    /// - Parameter client: The `WebSocketClient` object that represents the client that
    ///                    sent the message to this service
    public func received(message: String, from: WebSocketClient) {
        guard message.characters.count > 1 else { return }
        
        guard let messageType = message.characters.first else { return }
        
        let messageToForward = String(message.characters.dropFirst(2))
        
        if messageType == "M" || messageType == "T" || messageType == "S" {
            if let (_, _) = clients[from.id] {
                echo(message: message)
            }
        }
        else if messageType == "C" {
            guard messageToForward.characters.count > 0 else {
                from.close(reason: .invalidDataContents, description: "Connect message must have client's name")
                return
            }
            
            clients[from.id] = (messageToForward, from)
            
            echo(message: message)
        }
        else {
            from.close(reason: .invalidDataContents, description: "First character of the message must be a C, M, S, or T")
            if let (clientName, _) = clients.removeValue(forKey: from.id) {
                echo(message: "D:\(clientName)")
            }
        }
    }
    
    private func echo(message: String) {
        for (_, (_, client)) in clients {
            client.send(message: message)
        }
    }
}
