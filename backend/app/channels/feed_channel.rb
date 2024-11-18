# app/channels/feed_channel.rb
class FeedChannel < ApplicationCable::Channel
  def subscribed
    stream_for feed_channel
  end

  def unsubscribed
  end

  def speak(data)
    ActionCable.server.broadcast("feed_channel", message: "#{data["message"]}")
  end
end
