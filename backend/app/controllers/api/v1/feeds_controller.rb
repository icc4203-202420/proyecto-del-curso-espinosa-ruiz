class API::V1::FeedsController < ApplicationController
  respond_to :json
  before_action :set_user

  def index
    # Obtener las reviews y las event_pictures de las amistades del usuario actual
    friends = @user.friends

    # Filtrar reviews y event_pictures por amistades y ordenar por created_at
    reviews = Review.where(user: friends).order(created_at: :desc)
    event_pictures = EventPicture.where(user: friends).order(created_at: :desc)

    # Combinar ambas colecciones y ordenar por created_at en orden descendente
    feed_items = (reviews + event_pictures).sort_by(&:created_at).reverse

    render json: { feed: feed_items }, status: :ok
  end

  private

  def set_user
    @user = current_user
  end
end
