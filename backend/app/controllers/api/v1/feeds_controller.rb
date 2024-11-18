class API::V1::FeedsController < ApplicationController
  respond_to :json
  before_action :set_user

  def index
    friends = @user.friends + [@user]
    reviews = Review.where(user: friends).order(created_at: :desc)
    event_pictures = EventPicture.where(user: friends).order(created_at: :desc)
    feed_items = (reviews + event_pictures).sort_by(&:created_at).reverse

    render json: { feed: feed_items }, status: :ok
  end

  private

  def set_user
    @user = current_user
  end
end
