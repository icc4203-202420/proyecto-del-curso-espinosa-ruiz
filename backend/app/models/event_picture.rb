class EventPicture < ApplicationRecord
  belongs_to :event
  belongs_to :user
  has_one_attached :event_picture

  after_create_commit :broadcast_to_friends  # Agrega este callback

  private

  def broadcast_to_friends
    # Transmite esta imagen de evento a cada amigo del usuario actual
    user.friends.each do |friend|
      FeedChannel.broadcast_to(friend, {
        type: 'event_picture',
        data: {
          id: id,
          user: user.slice(:id, :first_name, :last_name),
          event: event.slice(:id, :name),
          description: description,
          created_at: created_at
        }
      })
    end
  end
end
