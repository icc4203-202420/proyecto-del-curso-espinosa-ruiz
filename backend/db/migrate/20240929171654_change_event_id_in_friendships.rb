class ChangeEventIdInFriendships < ActiveRecord::Migration[6.1]
  def change
    change_column :friendships, :event_id, :integer, null: true
  end
end
