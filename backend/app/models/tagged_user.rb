class TaggedUser < ApplicationRecord
    belongs_to :user
    belongs_to :event_picture
end
