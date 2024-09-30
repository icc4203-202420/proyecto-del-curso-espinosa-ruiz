class API::V1::UsersController < ApplicationController
  respond_to :json
  before_action :set_user, only: [:show, :update, :friendships, :create_friendship]
  before_action :authenticate_user!, only: [:friendships, :create_friendship, :update, :current]

  def index
    @users = User.includes(:reviews, :address).all   
    render json: @users, status: :ok
  end

  def show
    @user = User.find(params[:id])
    render json: @user, status: :ok
  end
  
  # PATCH/PUT /api/v1/users/:id
  def update
    if @user.update(user_params)
      render json: { message: 'User updated successfully' }, status: :ok
    else
      render json: @user.errors, status: :unprocessable_entity
    end
  end

  def create
    user = User.new(user_params)
    if user.save
      render json: user, status: :created
    else
      render json: { errors: user.errors.full_messages }, status: :unprocessable_entity
    end
  rescue => e
    render json: { error: e.message }, status: :unprocessable_entity
  end

  # Obtener el usuario actual
  def current
    render json: current_user
  end

  # GET /api/v1/users/:id/friendships - Lista las amistades
  def friendships
    @friends = @user.friends
    render json: @friends, status: :ok
  end

  # POST /api/v1/users/:id/friendships - Crea una nueva amistad
  def create_friendship
    # Encontrar el usuario que será el amigo
    friend = User.find_by(id: friendship_params[:friend_id])
  
    if friend.nil?
      render json: { error: 'Friend not found' }, status: :not_found
    elsif current_user == friend
      render json: { error: 'You cannot befriend yourself' }, status: :unprocessable_entity
    elsif Friendship.exists?(user: current_user, friend: friend) || Friendship.exists?(user: friend, friend: current_user)
      render json: { error: 'Friendship already exists' }, status: :unprocessable_entity
    else
      # Crear la amistad usando current_user como el "user" y el friend_id recibido en los parámetros
      friendship = current_user.friendships.build(friend: friend)
  
      if friendship.save
        render json: { message: 'Friendship created successfully' }, status: :created
      else
        # Añade un log para imprimir los errores en la consola del servidor
        Rails.logger.debug "Friendship creation failed: #{friendship.errors.full_messages.join(', ')}"
        render json: { errors: friendship.errors.full_messages }, status: :unprocessable_entity
      end
    end
  end
  

  private

  # Método para permitir solo los parámetros necesarios
  def friendship_params
    params.require(:friendship).permit(:friend_id)
  end

  def set_user
    @user = User.find(params[:id])
  end

  def user_params
    params.fetch(:user, {}).
        permit(:id, :first_name, :last_name, :email, :age, :handle, :password,
            { address_attributes: [:id, :line1, :line2, :city, :country, :country_id, 
              country_attributes: [:id, :name]], 
              reviews_attributes: [:id, :text, :rating, :beer_id, :_destroy]
            })
  end
end
