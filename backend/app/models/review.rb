class Review < ApplicationRecord
  belongs_to :user
  belongs_to :beer

  validates :rating, presence: true, numericality: { greater_than_or_equal_to: 1, less_than_or_equal_to: 5 }
  validates :text, presence: true, length: { minimum: 15, too_short: "must have at least 15 words" }

  after_save :update_beer_rating
  after_destroy :update_beer_rating
  after_create_commit :broadcast_to_friends  

  private

  def update_beer_rating
    beer.update_avg_rating
  end

  def broadcast_to_friends
    # Transmite esta review a cada amigo del usuario actual
    user.friends.each do |friend|
      FeedChannel.broadcast_to(friend, {
        type: 'review',
        data: {
          id: id,
          user: user.slice(:id, :first_name, :last_name),
          beer: beer.slice(:id, :name),
          rating: rating,
          text: text,
          created_at: created_at
        }
      })
    end
  end
end
