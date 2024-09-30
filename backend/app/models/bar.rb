class Bar < ApplicationRecord
  belongs_to :address
  has_many :events

  has_many :bars_beers
  has_many :beers, through: :bars_beers

  has_one_attached :image

  accepts_nested_attributes_for :address 

  validates :name, presence: true
  validates :image, content_type: { in: ['image/png', 'image/jpg', 'image/jpeg'],
                                    message: 'must be a valid image format' },
                    size: { less_than: 5.megabytes }

  def thumbnail
    image.variant(resize_to_limit: [200, 200]).processed
  end
end