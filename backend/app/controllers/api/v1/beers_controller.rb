class API::V1::BeersController < ApplicationController
  include ImageProcessing
  include Authenticable

  respond_to :json
  before_action :set_beer, only: [:show, :update, :destroy]
  before_action :verify_jwt_token, only: [:create, :update, :destroy]

# GET /beers
def index
  if params[:search]
    @beers = Beer.includes(:bars).where("name LIKE ?", "%#{params[:search]}%")
  else
    @beers = Beer.all
  end
  render json: { beers: @beers }, status: :ok
end

# GET /beers/:id
def show
  @beer = Beer.includes(:bars, :reviews, :brand).find(params[:id])
  average_rating = @beer.average_rating
  user_review = @beer.reviews.find_by(user_id: current_user.id) if current_user
  other_reviews = @beer.reviews.where.not(user_id: current_user.id) if current_user

  response = @beer.as_json(include: [ :bars,{ brand: { include: :brewery }}]).merge({
    average_rating: average_rating,
    user_review: user_review,
    other_reviews: other_reviews
  })

  if @beer.image.attached?
    response.merge!({
      image_url: url_for(@beer.image),
      thumbnail_url: url_for(@beer.thumbnail)
    })
  end

  render json: response, status: :ok
end

  # POST /beers
  def create
    @beer = Beer.new(beer_params.except(:image_base64))
    handle_image_attachment if beer_params[:image_base64]

    if @beer.save
      render json: { beer: @beer, message: 'Beer created successfully.' }, status: :created
    else
      render json: @beer.errors, status: :unprocessable_entity
    end
  end

  # PATCH/PUT /beers/:id
  def update
    handle_image_attachment if beer_params[:image_base64]

    if @beer.update(beer_params.except(:image_base64))
      render json: { beer: @beer, message: 'Beer updated successfully.' }, status: :ok
    else
      render json: @beer.errors, status: :unprocessable_entity
    end
  end

  ## DELETE /beers/:id
  def destroy
    @beer.destroy
    head :no_content
  end

  private

  def set_beer
    @beer = Beer.find_by(id: params[:id])
    render json: { error: 'Beer not found' }, status: :not_found if @beer.nil?
  end  

  def beer_params
    params.require(:beer).permit(:name, :beer_type, 
      :style, :hop, :yeast, :malts, 
      :ibu, :alcohol, :blg, :brand_id, :avg_rating,
      :image_base64)
  end

  def handle_image_attachment
    decoded_image = decode_image(beer_params[:image_base64])
    @beer.image.attach(io: decoded_image[:io], 
      filename: decoded_image[:filename], 
      content_type: decoded_image[:content_type])
  end 
  
  def verify_jwt_token
    authenticate_user!
    head :unauthorized unless current_user
  end  

  
end
