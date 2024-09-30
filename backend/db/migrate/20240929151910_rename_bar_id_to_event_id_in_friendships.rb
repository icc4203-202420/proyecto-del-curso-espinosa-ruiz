class RenameBarIdToEventIdInFriendships < ActiveRecord::Migration[6.0]
  def change
    rename_column :friendships, :bar_id, :event_id
  end
end
