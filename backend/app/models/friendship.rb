class Friendship < ApplicationRecord
  belongs_to :user
  belongs_to :friend, class_name: 'User'
  belongs_to :event, optional: true
  
  validates :user_id, uniqueness: { scope: :friend_id, message: "Friendship already exists" }
end
